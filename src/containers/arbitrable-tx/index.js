import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { BarLoader, BeatLoader } from 'react-spinners'
import { connect } from 'react-redux'
import { RenderIf } from 'lessdux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'


import { web3 } from '../../bootstrap/dapp-api'
import * as arbitrabletxActions from '../../actions/arbitrable-transaction'
import * as arbitrabletxSelectors from '../../reducers/arbitrable-transaction'
import { DISPUTE_CREATED, DISPUTE_RESOLVED } from '../../constants/arbitrable-tx'
import PayOrReimburseArbitrableTx from '../../components/pay-or-reimburse-arbitrable-tx'
import PayFeeArbitrableTx from '../../components/pay-fee-arbitrable-tx'
import TimeoutArbitrableTx from '../../components/timeout-arbitrable-tx'
import AppealArbitrableTx from '../../components/appeal-arbitrable-tx'
import NewEvidenceArbitrableTx from '../../components/new-evidence-arbitrable-tx'

import './arbitrable-tx.css'

class ArbitrableTx extends PureComponent {
  state = {
    payOrReimburse: 'payOrReimburse',
    arbitrabletx: {}
  }
  static propTypes = {
    arbitrabletx: arbitrabletxSelectors.arbitrabletxShape.isRequired,
    fetchArbitrabletx: PropTypes.func.isRequired,
    createDispute: PropTypes.func.isRequired,
    createAppeal: PropTypes.func.isRequired,
    createTimeout: PropTypes.func.isRequired,
    createPayOrReimburse: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { fetchArbitrabletx, arbitrableTxId } = this.props
    fetchArbitrabletx(arbitrableTxId)
  }

  static getDerivedStateFromProps(props, state) {
    const { arbitrabletx, accounts } = props
    if (arbitrabletx !== state.arbitrabletx)
      if (arbitrabletx.data) {
        return {
          ...state,
          arbitrabletx,
          payOrReimburse: arbitrabletx.data.buyer === accounts.data[0] ? 'Pay' : 'Reimburse'
        }
      }
    return null
  }

  onChangeAmount = e => this.setState({ amount: e.target.value })

  render() {
    const {
      createPayOrReimburse,
      createDispute,
      createTimeout,
      createAppeal,
      createEvidence
    } = this.props
    const { arbitrabletx, payOrReimburse } = this.state

    let amount = 0
    if (arbitrabletx.data && arbitrabletx.data.amount)
      amount = web3.utils.fromWei(arbitrabletx.data.amount.toString(), 'ether')
    return (
    <RenderIf
      resource={arbitrabletx}
      loading={
        <div className='loader'>
          <BarLoader color={'gray'} />
        </div>
      }
      done={
        arbitrabletx.data && (
          <div>
            seller: {arbitrabletx.data.seller}
            <br />
            arbitrator: {arbitrabletx.data.arbitrator}
            <br />
            sellerFee: {arbitrabletx.data.sellerFee}
            <br />
            buyerFee: {arbitrabletx.data.buyerFee}
            <br />
            status: {arbitrabletx.data.status}
            <br />
            amount: {arbitrabletx.data.amount}
            <br />
            {/* switch */}
            <PayOrReimburseArbitrableTx
              payOrReimburse={payOrReimburse}
              payOrReimburseFn={createPayOrReimburse}
              amount={amount}
              id={arbitrabletx.data.id}
            />
            <PayFeeArbitrableTx
              id={arbitrabletx.data.id}
              payFee={createDispute}
            />
            <TimeoutArbitrableTx
              id={arbitrabletx.data.id}
              timeout={createTimeout}
            />
            <AppealArbitrableTx
              id={arbitrabletx.data.id}
              appeal={createAppeal}
            />
            <NewEvidenceArbitrableTx
              id={arbitrabletx.data.id}
              submitEvidence={createEvidence}
            />
          </div>
        )
      }
      failedLoading={
        <div className='loader'>
          <BeatLoader color={'gray'} />
        </div>
      }
    />
    )
  }
}

export default connect(
  state => ({
    arbitrabletx: state.arbitrabletx.arbitrabletx,
    accounts: state.wallet.accounts
  }),
  {
    fetchArbitrabletx: arbitrabletxActions.fetchArbitrabletx,
    createAppeal: arbitrabletxActions.createAppeal,
    createDispute: arbitrabletxActions.createDispute,
    createPayOrReimburse: arbitrabletxActions.createPayOrReimburse,
    createTimeout: arbitrabletxActions.createTimeout,
    createEvidence: arbitrabletxActions.createEvidence
  }
)(ArbitrableTx)