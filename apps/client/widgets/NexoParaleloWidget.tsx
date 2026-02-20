/**
 * Widget de iOS: muestra "1 USD = X BS paralelo"
 * Requiere expo-widgets (development build, no Expo Go)
 */
import { Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { registerWidgetLayout, type WidgetBase } from "expo-widgets";

export type NexoParaleloWidgetProps = {
  paralelo: number;
  date?: string;
};

function formatParalelo(n: number): string {
  return n.toLocaleString("es-VE", { maximumFractionDigits: 2 });
}

const NexoParaleloWidget = (props: WidgetBase<NexoParaleloWidgetProps>) => {
  "widget";
  const { paralelo, date, family } = props;
  const formatted = formatParalelo(paralelo);

  if (family === "accessoryInline") {
    return (
      <Text modifiers={[font({ weight: "semibold", size: 14 }), foregroundStyle("#0FA226")]}>
        1 USD = {formatted} BS
      </Text>
    );
  }

  if (family === "accessoryCircular") {
    return (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ weight: "bold", size: 16 }), foregroundStyle("#0FA226")]}>
          {formatted}
        </Text>
        <Text modifiers={[font({ size: 10 }), foregroundStyle("#8e8e93")]}>BS/USD</Text>
      </VStack>
    );
  }

  // systemSmall, accessoryRectangular, systemMedium, systemLarge
  return (
    <VStack modifiers={[padding({ all: 12 })]}>
      <Text modifiers={[font({ weight: "bold", size: 18 }), foregroundStyle("#0FA226")]}>
        1 USD = {formatted} BS
      </Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle("#8e8e93")]}>
        Dólar paralelo
        {date ? ` · ${date}` : ""}
      </Text>
    </VStack>
  );
};

registerWidgetLayout("NexoParalelo", NexoParaleloWidget);
