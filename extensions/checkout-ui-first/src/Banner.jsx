  import {
  reactExtension,
  BlockLayout,
  BlockStack,
  View,
  InlineLayout,
  Heading,
  Image,
  Text,
  useAppMetafields,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {

  const metafieldsTitle = useAppMetafields({
    type: "shop",
    namespace : "checkout_title",
    key : "title"
  });

  const metafieldsText = useAppMetafields({
    type: "shop",
    namespace : "checkout_text",
    key : "text"
  });

  const metafieldsImage = useAppMetafields({
    type: "shop",
    namespace : "checkout_image",
    key : "image"
  });

  if (!metafieldsTitle || !metafieldsText || !metafieldsImage) {
    return null;
  }

  const titles = JSON.parse(metafieldsTitle[0]?.metafield?.value || "[]");
  const texts = JSON.parse(metafieldsText[0]?.metafield?.value || "[]");
  const images = JSON.parse(metafieldsImage[0]?.metafield?.value || "[]");

  const itemComponent = titles.map((title, index) => (
    <BlockStack key={index} border="base" padding="base" cornerRadius="base">
      <InlineLayout columns={['auto', 'fill']} spacing={['none', 'base']} blockAlignment="center">
        <View border="none" padding="none" minBlockSize={64} maxInlineSize={64} minInlineSize={64}>
          <Image source={images[index]} aspectRatio={1} alt={title} />
        </View>
        <View border="none" padding="none">
          <Heading level="2">{title}</Heading>
          <Text size="large">{texts[index]}</Text>
        </View>
      </InlineLayout>
    </BlockStack>
  ));

  return (
    <BlockLayout rows={['auto', 'auto', 'auto']} spacing={['base', 'none']}>
      {itemComponent}
    </BlockLayout>
  );
}
