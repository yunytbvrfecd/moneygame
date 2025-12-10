import Dice from "./Dice";
import { useState } from "react";

const Chinchirorin = ({ onSettlement, money }) => {
  const [returnRate, setReturnRate] = useState(0); // プレイヤー視点の倍率
  const [parentResults, setParentResults] = useState([[], 0]);
  const [playerResults, setPlayerResults] = useState([[], 0]);

  const [parentHand, setParentHand] = useState({ kind: 1, point: 0 });
  const [playerHand, setPlayerHand] = useState({ kind: 1, point: 0 });

  const [parentRollCount, setParentRollCount] = useState(0);
  const [playerRollCount, setPlayerRollCount] = useState(0);

  const [phase, setPhase] = useState("parent"); // "parent" | "player" | "result"
  const [period, setPeriod] = useState(1); // 第何ゲームか
  const [settlement, setSettlement] = useState("");

  const [betMoney, setBetMoney] = useState(100);
  const [isBetLocked, setIsBetLocked] = useState(false);

  const maxBet = Math.floor(money / 5);

  // 元の checkHand をほぼそのまま使用
  const checkHand = (results) => {
    const sortedresults = results[0].slice().sort((a, b) => a - b);

    // ゾロ目
    if (sortedresults[0] === sortedresults[2]) {
      if (sortedresults[0] === 1) {
        return [5, 0]; // ピンゾロ
      } else {
        return [3, 0]; // その他ゾロ目
      }
    }

    // ヒフミ
    if (
      sortedresults[0] === 1 &&
      sortedresults[1] === 2 &&
      sortedresults[2] === 3
    ) {
      return [-2, 0];
    }

    // シゴロ
    if (
      sortedresults[0] === 4 &&
      sortedresults[1] === 5 &&
      sortedresults[2] === 6
    ) {
      return [2, 0];
    }

    // 目あり（2つ同じ）
    if (sortedresults[0] === sortedresults[1]) {
      return [1, sortedresults[2]];
    }
    if (sortedresults[1] === sortedresults[2]) {
      return [1, sortedresults[0]];
    }

    // 目無し
    return [1, 0];
  };

  const isNoHand = (hand) => hand.kind === 1 && hand.point === 0;
  const isPoint = (hand) => hand.kind === 1 && hand.point > 0;
  const isRole = (hand) => hand.kind !== 1; // ゾロ目/シゴロ/ヒフミ

  // 勝敗判定（両者の最終結果が出そろったときに一回だけ呼ぶ）
  const decideOutcome = (parent, player) => {
    //両方目無し → 引き分け
    if (isNoHand(parent) && isNoHand(player)) {
      return { rate: 0, message: "引き分け" };
    }

    //一方だけ目無し → 目あり/役の勝ち
    if (isNoHand(parent) && !isNoHand(player)) {
      let rate = 1;
      if (isRole(player)) {
        rate = Math.abs(player.kind);
      }
      return { rate, message: "勝ち" };
    }
    if (!isNoHand(parent) && isNoHand(player)) {
      // 親の勝ち
      let rate = -1;
      if (isRole(parent)) {
        rate = -Math.abs(parent.kind);
      }
      return { rate, message: "負け" };
    }

    //どちらも役or目あり

    if (parent.kind === -2 && player.kind !== -2) {
      let rate = 1;
      if (isRole(player)) {
        rate = Math.abs(player.kind);
      }
      return { rate, message: "勝ち" };
    }
    if (player.kind === -2 && parent.kind !== -2) {
      let rate = -1;
      if (isRole(parent)) {
        rate = -Math.abs(parent.kind);
      }
      return { rate, message: "負け" };
    }

    //役vs目あり
    if (isRole(parent) && isPoint(player)) {
      let rate = -Math.abs(parent.kind);
      return { rate, message: "負け" };
    }
    if (isRole(player) && isPoint(parent)) {
      let rate = Math.abs(player.kind);
      return { rate, message: "勝ち" };
    }

    //役vs役
    if (isRole(parent) && isRole(player)) {
      const rank = (hand) => {
        if (hand.kind === 5) return 5; // ピンゾロ
        if (hand.kind === 3) return 3; // ゾロ目
        if (hand.kind === 2) return 2; // シゴロ
        if (hand.kind === -2) return -1; // ヒフミ
        return 0;
      };
      const pr = rank(parent);
      const pl = rank(player);
      if (pl > pr) {
        return { rate: Math.abs(player.kind), message: "勝ち" };
      } else if (pl < pr) {
        return { rate: -Math.abs(parent.kind), message: "負け" };
      } else {
        return { rate: 0, message: "引き分け" };
      }
    }

    //普通の点数勝負
    if (isPoint(parent) && isPoint(player)) {
      if (player.point > parent.point) {
        return { rate: 1, message: "勝ち" };
      } else if (player.point < parent.point) {
        return { rate: -1, message: "負け" };
      } else {
        return { rate: 0, message: "引き分け" };
      }
    }

    //引き分け
    return { rate: 0, message: "引き分けです" };
  };

  const resetGame = () => {
    setParentResults([[], 0]);
    setPlayerResults([[], 0]);
    setParentHand({ kind: 1, point: 0 });
    setPlayerHand({ kind: 1, point: 0 });
    setParentRollCount(0);
    setPlayerRollCount(0);
    setReturnRate(0);
    setSettlement("");
    setPhase("parent");
    setPeriod((p) => p + 1);
    setIsBetLocked(false);
  };

  const handleRoll = () => {
    if (phase === "result") return;

    // 掛け金ロック
    if (!isBetLocked) {
      setIsBetLocked(true);
    }

    const dice = Dice(3, 6);
    const [kind, point] = checkHand(dice);

    if (phase === "parent") {
      // 親の番
      setParentResults(dice);
      const nextHand = { kind, point };
      setParentHand(nextHand);

      if (isNoHand(nextHand) && parentRollCount === 0) {
        setParentRollCount(1);
      } else {
        setParentRollCount(0);
        setPhase("player");
      }
    } else if (phase === "player") {
      // プレイヤーの番
      setPlayerResults(dice);
      const nextHand = { kind, point };
      setPlayerHand(nextHand);

      if (isNoHand(nextHand) && playerRollCount === 0) {
        setPlayerRollCount(1);
      } else {
        setPlayerRollCount(0);
        const outcome = decideOutcome(parentHand, nextHand);
        setReturnRate(outcome.rate);
        setSettlement(outcome.message);
        setPhase("result");

        if (onSettlement) {
          onSettlement(outcome.rate, betMoney);
        }
      }
    }
  };

  const currentTurnLabel =
    phase === "parent" ? "親番" : phase === "player" ? "子番" : "結果";

  const currentThrow =
    phase === "parent"
      ? parentRollCount + 1
      : phase === "player"
      ? playerRollCount + 1
      : null;

  return (
    <div>
      <div>第{period}ゲーム</div>
      <div>状態: {currentTurnLabel}</div>
      {currentThrow && <div>{currentThrow}投目</div>}

      <hr />
      <div style={{ marginTop: "8px" }}>
        <label>
          掛け金：
          <input
            type="number"
            value={betMoney}
            onChange={(e) => {
              let v = Number(e.target.value);
              if (Number.isNaN(v)) return;
              // 0 未満なし
              v = Math.max(0, v);
              //所持金1/5を上限にする
              v = Math.min(v, maxBet);
              setBetMoney(v);
            }}
            // サイコロを振り始めたらロック
            disabled={isBetLocked}
          />
        </label>
        <div>このゲームの収支: {betMoney * returnRate}</div>
        {isBetLocked && (
          <span style={{ marginLeft: 8 }}>（このゲーム中は変更不可）</span>
        )}
      </div>
      <div>親が振ったサイコロ: {parentResults[0].join(", ")}</div>
      <div>
        親の状態:
        {isNoHand(parentHand)
          ? "目無し"
          : isRole(parentHand)
          ? `役(kind=${parentHand.kind})`
          : `目あり(${parentHand.point})`}
      </div>

      <div>あなたが振ったサイコロ: {playerResults[0].join(", ")}</div>
      <div>
        あなたの状態:
        {isNoHand(playerHand)
          ? "目無し"
          : isRole(playerHand)
          ? `役(kind=${playerHand.kind})`
          : `目あり(${playerHand.point})`}
      </div>

      <hr />

      <div>結果倍率: {returnRate}</div>
      <div>{settlement}</div>

      <button
        onClick={() => {
          if (phase === "result") {
            resetGame();
          } else {
            handleRoll();
          }
        }}
      >
        {phase === "parent"
          ? "親番（振る）"
          : phase === "player"
          ? "子番（振る）"
          : "次のゲームへ"}
      </button>
    </div>
  );
};

export default Chinchirorin;
