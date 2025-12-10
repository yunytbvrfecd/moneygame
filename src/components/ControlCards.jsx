import { useState, useEffect } from "react";

const ControlCards = () => {
  const suits = ["♠", "♥", "♦", "♣"];
  const [deck, setDeck] = useState([]);
  const [hands, setHands] = useState([]);

  // デッキ作成
  const createDeck = () => {
    const newDeck = [];
    for (const suit of suits) {
      for (let rank = 1; rank <= 13; rank++) {
        newDeck.push({ suit, rank });
      }
    }
    return newDeck;
  };

  // シャッフル
  const shuffleDeck = (targetDeck) => {
    const newDeck = [...targetDeck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      // ランダムな位置と入れ替えを行うにはi--を用いて既に動かした場所に触れないようにする
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const resetDeck = () => {
    const deckCreated = createDeck();
    const deckShuffled = shuffleDeck(deckCreated);
    setDeck(deckShuffled);
  }

  // 指定枚数配布
  const dealCards = (cards) => {
    if (deck.length < cards) {
      console.log("山札が足りない");
      return;
    }

    const newDeck = [...deck];
    const newHands = [];

    newHands.push(...hands)
    for (let i = 0; i < cards; i++) {
      newHands.push(newDeck.pop());
    }

    setDeck(newDeck);
    setHands(newHands);
    console.log("配布予定の枚数", cards, "配布されたカード", newHands);
  };

  // デッキ確認（ボタンから呼ぶ用）
  const checkDeck = () => {
    console.log("現在のデッキ", deck);
  };

  // 手札の廃棄
  const disCards = () => {
    const newHands = [];
    setHands(newHands);
  }

  return (
    <div>
      <h1>Trump Card Game</h1>

      <div>現在の山札:{deck.length} 枚</div>
      <button onClick={resetDeck}>山札の生成</button>
      <button onClick={() => dealCards(5)}>カードを5枚配る</button>
      <button onClick={disCards}>カードを廃棄する</button>
      <button onClick={checkDeck}>デッキをコンソールに表示</button>

      <div>
        <h2>手札</h2>
        <ul>
          {hands.map((card, index) => (
            <div key={index}>
              {card.suit} {card.rank}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ControlCards;
