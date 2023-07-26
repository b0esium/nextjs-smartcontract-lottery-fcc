import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")

    const dispatch = useNotification()

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    const { runContractFunction: getNumPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumPlayers",
        params: {},
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            async function updateUI() {
                const entranceFeeFromCall = await getEntranceFee()
                const entranceFeeString = entranceFeeFromCall._hex
                setEntranceFee(entranceFeeString)
                // players
                const numPlayersObj = await getNumPlayers()
                numPlayersString = parseInt(numPlayersObj._hex)
                setNumPlayers(numPlayersString)
            }
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                    >
                        Enter Raffle
                    </button>
                    <div>Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <button
                        onClick={async function () {
                            const numPlayersObj = await getNumPlayers({
                                onError: (error) => console.log(error),
                            })
                            numPlayersString = parseInt(numPlayersObj._hex)
                            setNumPlayers(numPlayersString)
                        }}
                    >
                        Update Number of players
                    </button>
                    <div>Number of players: {numPlayers}</div>
                </div>
            ) : (
                <div>No raffle contract detected</div>
            )}
        </div>
    )
}

export default LotteryEntrance
