import { useMemo } from "react";
import Svg, { Polyline } from "react-native-svg";
import { useSettings } from "@/lib/settings";
import { getColors } from "@/lib/theme";

const W = 44;
const H = 20;
const PAD = 2;

type Props = {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
};

export function Sparkline({ values, color, width = W, height = H }: Props) {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const resolvedColor = color ?? colors.accent;
  const points = useMemo(() => {
    if (values.length < 2) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = width - PAD * 2;
    const h = height - PAD * 2;
    return values
      .map((v, i) => {
        const x = PAD + (i / (values.length - 1)) * w;
        const y = PAD + h - ((v - min) / range) * h;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values, width, height]);

  if (values.length < 2) return null;

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
