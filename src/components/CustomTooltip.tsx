const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-medium">{`${label}`}</p>
        <p className="text-sm text-primary">
          {`Offsets: ${Number(data.offset).toFixed(3)} tons`}
        </p>
        <p className="text-xs text-gray-500">{`${data.count} transactions`}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
