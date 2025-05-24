import { Flex, Radio, Text } from '@radix-ui/themes'

interface Props {
  value: string
}
export default function RadioButton({ value }: Props) {
  return (
    <Flex asChild gap="2">
      <Text as="label" size="2">
        <Radio name="example" value="1" defaultChecked />
        {value}
      </Text>
    </Flex>
  )
}
