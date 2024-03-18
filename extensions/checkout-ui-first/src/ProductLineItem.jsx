  import { useEffect, useState } from 'react';
  import {
    reactExtension,
    useCartLineTarget,
    Text,
    useAppMetafields,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.cart-line-item.render-after',
  () => <Extension />,
);

function Extension() {

  const metafieldsProducts = useAppMetafields({
    type: "product",
    namespace : "checkout_product_line",
    key : "line"
  });

  const cartLineTarget = useCartLineTarget();
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    // Get the product ID from the cart line item
    const productId = cartLineTarget?.merchandise?.product?.id;
    if (!productId) {
      return;
    }

    const metafieldsProduct = metafieldsProducts.find(({target}) => {
      // Check if the target of the metafield is the product from our cart line
      return `gid://shopify/Product/${target.id}` === productId;
    });

    if (typeof metafieldsProduct?.metafield?.value === "string") {
      setAdditionalInfo(metafieldsProduct.metafield.value);
    }

  }, [cartLineTarget, metafieldsProducts]);

  return (
    <Text size="small" emphasis="italic" appearance="warning">
    { additionalInfo }
  </Text>
  );
}
