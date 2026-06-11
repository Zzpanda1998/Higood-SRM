type LogicSection = {
  title: string;
  headers: string[];
  rows: string[][];
};

export default function DesignLogicCard({ sections }: { sections: LogicSection[] }) {
  return (
    <section className="mt-4 rounded border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold text-gray-900">设计逻辑说明</h2>
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={section.title}>
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              {index + 1}. {section.title}
            </h3>
            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="min-w-full text-left text-[13px]">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    {section.headers.map((header) => (
                      <th key={header} className="border-b border-gray-200 px-3 py-2 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-100 last:border-0">
                      {row.map((cell, cellIndex) => (
                        <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 text-gray-700">
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
