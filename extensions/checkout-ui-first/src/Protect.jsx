  import { useEffect, useState } from 'react';
  import {
  useAppMetafields,
  useApi,
  useCartLines,
  useApplyCartLinesChange,
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
  'purchase.checkout.cart-line-list.render-after',
  () => <Extension />,
);

function Extension() {

  const { query, i18n } = useApi();
  const cartLines = useCartLines()
  const applyCartLinesChange = useApplyCartLinesChange()

  const [variantData, setVariantData] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  
  const metafieldsProduct = useAppMetafields({
    type: "shop",
    namespace : "checkout_protect",
    key : "product"
  });
  
  if (!metafieldsProduct) {
    return null;
  }
  
  const variantId = metafieldsProduct[0]?.metafield?.value;


  useEffect(() => {
    if (variantId !== undefined) {
      getVariantData();
    }
    
  }, [variantId]);

  async function getVariantData() {
    try {
      const queryResult = await query(`{
        node(id:"${variantId}"){
          ... on ProductVariant {
            title
            price {
              amount
              currencyCode
            },
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
      }`)

      if (queryResult.data) {
        setVariantData(queryResult.data.node)
      }
    } catch (error) {
      console.error('Error fetching variant data:', error);
    }
  }
  
  useEffect(() => {
    if (isSelected) {
      applyCartLinesChange({
        type: "addCartLine",
        merchandiseId: variantId,
        quantity: 1,
      })

    } else {
      
      const foundCartLine = cartLines.find((cartLine) => {
        return cartLine.merchandise.id === variantId;
      });
    
      if(foundCartLine) {
        applyCartLinesChange({
          type: "removeCartLine",
          id: foundCartLine?.id,
          quantity: 1,
        })
      }
    }

  }, [isSelected, variantId]);

  if(!variantData) return null;

  const renderPrice = i18n.formatCurrency(variantData.price.amount);
  

  return (
    <>
      <Divider />
      <BlockStack border="none" padding={['base', 'none']}>
        <Heading level="2">{ variantData.product.title }</Heading>
      </BlockStack>
      <Pressable
        border="base"
        cornerRadius="base"
        padding="base"
        background="subdued"
        onPress={
          () => setIsSelected(!isSelected)
        }
      >
        <InlineLayout columns={['auto', 80, 'fill']} spacing={['base', 'base']} blockAlignment="center">
          <Checkbox checked={isSelected} />
          <Image 
            source={ variantData.image.url || variantData.product.featuredImage.url }
            aspectRatio={1}
            accessibilityDescription={ variantData.image.alt || variantData.product.featuredImage.alt }
          />
          <BlockStack>
            <TextBlock size="small">{ variantData.product.description }</TextBlock>
            <Text size="large">{ renderPrice }</Text>
          </BlockStack>
        </InlineLayout>
      </Pressable>
    </>
  );
}
