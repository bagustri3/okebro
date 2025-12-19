'use client';

interface ThemeSettingsProps {
  accentColor: string;
  onColorChange: (color: string) => void;
}

export default function ThemeSettings({ accentColor, onColorChange }: ThemeSettingsProps) {
  const presetColors = [
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Cyan', value: '#06b6d4' },
  ];

  return (
    <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <i className="ri-palette-line" style={{ color: accentColor }}></i>
        Theme Settings
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Accent Color</label>
          <div className="grid grid-cols-3 gap-2">
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(color.value)}
                className="relative p-3 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: color.value + '20',
                  borderColor: accentColor === color.value ? color.value : 'transparent'
                }}
              >
                <div 
                  className="w-6 h-6 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: color.value }}
                ></div>
                <div className="text-xs text-center">{color.name}</div>
                {accentColor === color.value && (
                  <div className="absolute top-1 right-1">
                    <i className="ri-check-line text-sm" style={{ color: color.value }}></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Custom Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-12 rounded-lg border-2 border-gray-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm cursor-text"
              placeholder="#10b981"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Dark Mode</span>
            <div className="flex items-center gap-2">
              <i className="ri-moon-line" style={{ color: accentColor }}></i>
              <span className="text-gray-500">Always On</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
