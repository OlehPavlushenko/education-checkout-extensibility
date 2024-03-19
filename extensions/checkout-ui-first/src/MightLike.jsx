  import { useEffect, useState } from 'react';
  import {
  useAppMetafields,
  useApi,
  useCartLines,
  useApplyCartLinesChange,
  reactExtension,
  Button,
  Heading,
  Text,
  InlineLayout,
  Image,
  BlockStack,
  Divider,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.header.render-after',
  () => <Extension />,
);

function Extension() {
  
  const [products, setVariantsData] = useState([]);
  const [isMetafieldsLoaded, setMetafieldsLoaded] = useState(false);
  const [variantIds, setVariantIds] = useState([]);

  const [adding, setAdding] = useState(false);
  const [showError, setShowError] = useState(false);

  const { query, i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange()
  const cartLines = useCartLines()

  const metafieldsProduct = useAppMetafields({
    type: "shop",
    namespace : "checkout_might_like",
    key : "products"
  });

  if (!metafieldsProduct) return null;
  
  useEffect(() => {
    if (!isMetafieldsLoaded) {
      if (metafieldsProduct.length > 0) {
        const parsedVariantIds = JSON.parse(metafieldsProduct[0]?.metafield?.value || '[]');
        setVariantIds(parsedVariantIds);
        setMetafieldsLoaded(true);
      }
    }
  }, [metafieldsProduct, isMetafieldsLoaded]);
  
  useEffect(() => {
    if (isMetafieldsLoaded) {
      if (variantIds.length > 0) {
        getVariantsData(variantIds);
      }
    }
  }, [variantIds, isMetafieldsLoaded]);
  
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  async function getVariantsData(variantIds) {
    try {
      const queries = variantIds.map((variantId, index) => {
        return `
          variant${index + 1}: node(id: "${variantId}") {
            ... on ProductVariant {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
              product {
                title
                description
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        `;
      });
  
      const queryResult = await query(`{
        ${queries.join('\n')}
      }`);
  
      const products = Object.values(queryResult.data);

      if (products.length > 0) {
        setVariantsData(products);
      }
    } catch (error) {
      console.error('Error fetching variant data:', error);
    }
  }

  async function handleAddToCart(variantId) {
    setAdding(true);
    const result = await applyCartLinesChange({
      type: 'addCartLine',
      merchandiseId: variantId,
      quantity: 1,
    });
    setAdding(false);
    if (result.type === 'error') {
      setShowError(true);
      console.error(result.message);
    }
  }

  if (products.length === 0) {
    return null;
  }

  const productsOnOffer = getProductsOnOffer(cartLines, products);

  console.log("productsOnOffer", productsOnOffer)

  if (!productsOnOffer.length) {
    return null;
  }
  
  return (
    <>
      <Divider />
      <BlockStack border="none" padding={['base', 'none']}>
        <Heading level="2">You might also like</Heading>
      </BlockStack>
      <ProductOffer
        data={productsOnOffer[0]}
        i18n={i18n}
        adding={adding}
        handleAddToCart={handleAddToCart}
      />
      {showError && <ErrorBanner />}
    </>
  );
}

function getProductsOnOffer(lines, products) {
  const cartLineProductVariantIds = lines.map((item) => item.merchandise.id);
  return products.filter((product) => {
    const isProductVariantInCart = cartLineProductVariantIds.includes(product.id);
    return !isProductVariantInCart;
  });
}

function ProductOffer({ data, i18n, adding, handleAddToCart}) {
  const renderPrice = i18n.formatCurrency(data.price.amount);
  const imageUrl = data.image.url || data.product.featuredImage.url
  const imageAlt = data.image.alt || data.product.featuredImage.alt

  return (
      <BlockStack spacing='loose'>
        <InlineLayout
          spacing='base'
          columns={[64, 'fill', 'auto']}
          blockAlignment='center'
        >
          <Image
            border='base'
            borderWidth='base'
            borderRadius='loose'
            source={imageUrl}
            description={data.product.title}
            aspectRatio={1}
            accessibilityDescription={ imageAlt }
          />
          <BlockStack spacing='none'>
            <Text size='medium' emphasis='strong'>
              {data.product.title}
            </Text>
            <Text appearance='subdued'>{renderPrice}</Text>
          </BlockStack>
          <Button
            kind='secondary'
            loading={adding}
            accessibilityLabel={`Add ${data.product.title} to cart`}
            onPress={() => handleAddToCart(data.id)}
          >
            Add
          </Button>
        </InlineLayout>
      </BlockStack>
  );
}

function ErrorBanner() {
  return (
    <Banner status='critical'>
      There was an issue adding this product. Please try again.
    </Banner>
  );
}
