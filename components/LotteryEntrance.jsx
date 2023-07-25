import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFee, setEntranceFee] = useState("0")

    // const { runContractFunction: enterRaffle} = useWeb3Contract({abi: abi,contractAddress:raffleAddress,functionName:"enterRaffle", params: {}, msgValue: })
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            async function updateUI() {
                const entranceFeeFromCall = await getEntranceFee()
                const entranceFeeString = entranceFeeFromCall._hex
                entranceFeeString = ethers.utils.formatUnits(entranceFeeString, "ether")
                setEntranceFee(entranceFeeString)
                console.log(entranceFee)
                console.log(typeof entranceFee)
            }
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            Entrance fee: <div>{entranceFee} ETH</div>
        </div>
    )
}

export default LotteryEntrance
