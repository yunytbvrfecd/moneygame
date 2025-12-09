import {useState} from "react";
import Chinchirorin from "./chinchirorin.jsx";


const ControlMoney = () => {
    const [money, setMoney] = useState(1000);

const handleSettlement = (rate, betMoney) =>{
    setMoney((prev) => prev + betMoney * rate);
}

    return(
        <div>
            <div align="right">所持金:{money} </div>
        <Chinchirorin onSettlement={handleSettlement} money={money}/>
        </div>
    )
}

export default ControlMoney;