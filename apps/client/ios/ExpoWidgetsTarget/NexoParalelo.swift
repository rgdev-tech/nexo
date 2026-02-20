import WidgetKit
import SwiftUI
internal import ExpoWidgets

struct NexoParalelo: Widget {
  let name: String = "NexoParalelo"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: name, provider: WidgetsTimelineProvider(name: name)) { entry in
      WidgetsEntryView(entry: entry)
    }
    .configurationDisplayName("Dólar Paralelo")
    .description("1 USD en bolívares (paralelo)")
    .supportedFamilies([.systemSmall, .accessoryRectangular, .accessoryInline])
  }
}