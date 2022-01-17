import { useState, useEffect } from 'react'
import { ethers, utils } from 'ethers'
import abi from './contracts/CrowdFunding.json'

function App() {
  const contractAddress = '0xe2b615796daf05add6a81671922a2329d2fee882'
  const contractABI = abi.abi

  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [inputValue, setInputValue] = useState({
    withdraweeAddress: '',
    withdrawAmount: '',
    donateAmount: '',
  })
  const [isFundRaiser, setIsFundRaiser] = useState(false)
  const [fundRaiserAddress, setFundRaiserAddress] = useState(null)
  const [error, setError] = useState(null)
  const [totalFundDonated, setTotalFundDonated] = useState(null)
  const [totalAmountFunded, setTotalAmountFunded] = useState(null)
  const [totalAmountWithdrawn, setTotalAmountWithdrawn] = useState(null)

  const handleInputChange = async (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }))
  }

  const clearDonateAmount = async () => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      donateAmount: '',
    }))
  }

  const withdrawAmountHandler = async (event) => {
    try {
      event.preventDefault()

      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const txn = await bankContract.withdrawFunds(
          inputValue.withdraweeAddress,
          ethers.utils.parseEther(inputValue.withdrawAmount)
        )
        console.log('Withdrawing money...')

        await txn.wait()

        console.log('Money with drew...done', txn.hash)

        totalAmountWithdrawnHandler()
      } else {
        console.log('Ethereum object not found, install Metamask.')

        setError('Please install a MetaMask wallet to use our bank.')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })

        const account = accounts[0]
        setIsWalletConnected(true)

        window.ethereum.on('accountsChanged', refresh)

        console.log('Account Connected: ', account)
      } else {
        setError('Please install a MetaMask wallet to use our bank.')

        console.log('No Metamask detected')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getFundRaiserHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const crowdFundingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        let owner = await crowdFundingContract.fundRaiser()
        setFundRaiserAddress(owner)

        const [account] = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsFundRaiser(true)
        } else {
          setIsFundRaiser(false)
        }
      } else {
        console.log('Ethereum object not found, install Metamask.')

        setError('Please install a MetaMask wallet to use our bank.')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const donatedFundHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const crowdFundingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        let balance = await crowdFundingContract.getDonatedFund()
        setTotalFundDonated(utils.formatEther(balance))

        console.log('Retrieved balance...', balance)
      } else {
        console.log('Ethereum object not found, install Metamask.')

        setError('Please install a MetaMask wallet to use our bank.')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const totalFundDonatedHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const crowdFundingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        let balance = await crowdFundingContract.totalAmountFunded()
        setTotalAmountFunded(utils.formatEther(balance))

        console.log('Retrieved balance...', balance)
      } else {
        console.log('Ethereum object not found, install Metamask.')

        setError('Please install a MetaMask wallet to use our bank.')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const totalAmountWithdrawnHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const crowdFundingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        let balance = await crowdFundingContract.totalAmountWithdrawn()
        setTotalAmountWithdrawn(utils.formatEther(balance))

        console.log('Retrieved balance...', balance)
      } else {
        console.log('Ethereum object not found, install Metamask.')

        setError('Please install a MetaMask wallet to use our bank.')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault()

      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        const txn = await bankContract.donateFund({
          value: ethers.utils.parseEther(inputValue.donateAmount),
        })
        console.log('Deposting money...')

        await txn.wait()

        console.log('Deposited money...done', txn.hash)

        clearDonateAmount()
        donatedFundHandler()
        totalFundDonatedHandler()
      } else {
        console.log('Ethereum object not found, install Metamask.')

        setError('Please install a MetaMask wallet to use our bank.')
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    getFundRaiserHandler()
    donatedFundHandler()
    totalFundDonatedHandler()
    totalAmountWithdrawnHandler()
  }, [isWalletConnected])

  const refresh = () => {
    checkIfWalletIsConnected()
    getFundRaiserHandler()
    donatedFundHandler()
    totalFundDonatedHandler()
    totalAmountWithdrawnHandler()
  }

  return (
    <>
      <main className='main-container'>
        <h2 className='headline'>
          <span className='headline-gradient'>Crowd Funding DAPP</span> 💰
        </h2>
        <section className='customer-section px-10 pt-5 pb-10'>
          {error && <p className='text-2xl text-red-700'>{error}</p>}
          <div className='mt-7 mb-9'>
            <form className='form-style'>
              <input
                type='text'
                className='input-style'
                onChange={handleInputChange}
                name='donateAmount'
                placeholder='0.0000 ETH'
                value={inputValue.donateAmount}
              />
              <button className='btn-purple' onClick={deposityMoneyHandler}>
                Donate Fund
              </button>
            </form>
          </div>
          <div className='mt-5'>
            <p>
              <span className='font-bold'>Total Fund donated by me : </span>
              {totalFundDonated}
            </p>
          </div>
          <div className='mt-5'>
            <p>
              <span className='font-bold'>Total Amount Funded : </span>
              {totalAmountFunded}
            </p>
          </div>
          <div className='mt-5'>
            <p>
              <span className='font-bold'>Total Amount Withdrawn : </span>
              {totalAmountWithdrawn}
            </p>
          </div>
          <div className='mt-5'>
            <p>
              <span className='font-bold'>Fund Raiser's Address : </span>
              {fundRaiserAddress}
            </p>
          </div>
        </section>
        {isFundRaiser && (
          <section className='bank-owner-section'>
            <h2 className='text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold'>
              Fund Raiser's Panel
            </h2>
            <div className='p-10'>
              <form className='form-style'>
                <input
                  type='text'
                  className='input-style'
                  onChange={handleInputChange}
                  name='withdraweeAddress'
                  placeholder='Enter address of account in which to withdraw'
                  value={inputValue.withdraweeAddress}
                />
                <input
                  type='text'
                  className='input-style'
                  onChange={handleInputChange}
                  name='withdrawAmount'
                  placeholder='Enter amount to withdraw'
                  value={inputValue.withdrawAmount}
                />
                <button className='btn-grey' onClick={withdrawAmountHandler}>
                  Withdraw Money
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </>
  )
}

export default App
