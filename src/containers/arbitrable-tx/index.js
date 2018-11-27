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
import AppealArbitrableTx from '../../components/appeal-arbitrable-tx'
import EvidenceArbitrableTxList from '../../components/evidence-arbitrable-tx-list'
import ResumeArbitrableTx from '../../components/resume-arbitrable-tx'
import renderStatusArbitrableTxSwitch from '../../utils/render-status-arbitrable-tx-switch'


import './arbitrable-tx.css'

class ArbitrableTx extends PureComponent {
  state = {
    payOrReimburse: 'payOrReimburse',
    arbitrabletx: {
      data: {
        appealable: false,
        evidences: []
      }
    }
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
      createEvidence,
      accounts
    } = this.props
    const { arbitrabletx, payOrReimburse } = this.state

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
          <ResumeArbitrableTx
            arbitrabletx={arbitrabletx.data}
            title={<React.Fragment>Resume</React.Fragment>}
          >
            <React.Fragment>
              {
                renderStatusArbitrableTxSwitch(
                  accounts, 
                  arbitrabletx,
                  payOrReimburse,
                  createPayOrReimburse,
                  createDispute,
                  createTimeout,
                  createEvidence
                )
              }
              {
                arbitrabletx.data.appealable && 
                <AppealArbitrableTx
                  id={arbitrabletx.data.id}
                  appeal={createAppeal}
                />
              }
              {
                arbitrabletx.data.evidences && arbitrabletx.data.evidences.length > 0 && 
                <EvidenceArbitrableTxList
                  evidenceArbitrabletxs={arbitrabletx.data.evidences}
                />
              }
            </React.Fragment>
          </ResumeArbitrableTx>
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