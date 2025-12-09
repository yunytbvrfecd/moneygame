export default function TargetControls({useTarget, targetValue, onMode, onValue }) {
  return (
    <h3>
      目標値を設定する
      <input type="radio" className="ctl" name="target-valid" checked={useTarget} onChange={() => onMode(true)}/>
      <input type="number" className="ctl" style={{ width: 60 }} value={targetValue ?? ""} 
            disabled={!useTarget}
        onChange={(e) => {
          const v = e.target.value;
          onValue(v === "" ? null : Number(v));  // 空文字も扱う
        }}
      />
      <> しない</>
      <input type="radio" className="ctl" name="target-valid" checked={!useTarget}
        onChange={() => {
          onMode(false);
          onValue(null);
        }}
      />
    </h3>
  );
}
