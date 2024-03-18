  import { useEffect, useState } from 'react';
  import {
  useApi,
  useCartLines,
  useApplyCartLinesChange,
  useAppMetafields,
  reactExtension,
  Pressable,
  Heading,
  Text,
  TextBlock,
  Checkbox,
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
  const [loading, setLoading] = useState(false);

  const metafieldsProduct = useAppMetafields({
    type: "shop",
    namespace : "checkout_might_like",
    key : "products"
  });
  
  if (!metafieldsProduct) return null;

  const variantIds = JSON.parse(metafieldsProduct[0]?.metafield?.value || "[]");

  const { query, i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange()
  const cartLines = useCartLines()
  
  
 
  useEffect(() => {
    if (variantIds.length > 0) {
      getVariantsData(variantIds);
    }
  }, [variantIds]);

  async function getVariantsData(variantIds) {
    setLoading(true);
    try {
      const queries = variantIds.map((variantId, index) => {
        return `
          variant${index + 1}: node(id: "${variantId}") {
            ... on ProductVariant {
              id
              title
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
    } finally {
      setLoading(false);
    }
  }

  if (!loading && products.length === 0) {
    return null;
  }

  const productsOnOffer = getProductsOnOffer(cartLines, products);

  if (!productsOnOffer.length) {
    return null;
  }
  
  //const renderPrice = i18n.formatCurrency(variantData.price.amount);

  return (
    <>
      <Divider />
      <BlockStack border="none" padding={['base', 'none']}>
        <Heading level="2">You might also like</Heading>
      </BlockStack>
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
