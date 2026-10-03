import json
from pathlib import Path

from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded
from gltest.types import TransactionStatus
from gltest.utils import extract_contract_address


CONTRACTS = Path(__file__).parents[2] / "contracts"


def _hash(receipt):
    return str(receipt.get("hash") or receipt.get("transaction_hash") or receipt.get("tx_hash") or receipt.get("tx_id") or "UNKNOWN")


def _record(label, receipt):
    print(f"PAVERON_EVIDENCE {label}={_hash(receipt)}")
    print(
        "PAVERON_RECEIPT "
        + json.dumps(
            {
                "label": label,
                "result_name": receipt.get("result_name"),
                "execution_result": receipt.get("execution_result"),
                "triggered_transactions": receipt.get("triggered_transactions", []),
            },
            default=str,
            sort_keys=True,
        )
    )


def test_paveron_deploys_on_studionet():
    factory = get_contract_factory(contract_file_path=CONTRACTS / "Paveron.py")
    receipt = factory.deploy_contract_tx(
        args=[1],
        wait_transaction_status=TransactionStatus.FINALIZED,
        wait_interval=5000,
        wait_retries=180,
    )
    assert tx_execution_succeeded(receipt), receipt
    address = extract_contract_address(receipt)
    pool = factory.build_contract(contract_address=address)
    _record("PAVERON_DEPLOY", receipt)
    print(f"PAVERON_EVIDENCE PAVERON_ADDRESS={address}")
    summary = pool.get_pool(args=[]).call()
    assert summary["cover_count"] == "0"
    assert summary["active_count"] == "0"
    assert summary["paid_count"] == "0"
    assert summary["incident_count"] == "0"
    assert summary["min_premium"] == "1"
