const Dice = (dicequantity,diceMax) => {
    /*console.log("Dice関数の中", dicequantity, diceMax);*/
    let results = [];
    let Point = 0;
    for(let i = 1; i <= dicequantity; i++){
        let dicevalue =  Math.floor(Math.random() * diceMax) + 1;
        Point += dicevalue;
        results.push(dicevalue);
        /*console.log("ダイス",{i},":",dicevalue);*/
    }
    return [results,Point];

}

export default Dice;