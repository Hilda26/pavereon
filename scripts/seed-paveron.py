import os
import time
from pathlib import Path

from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded
from gltest.types import TransactionStatus
from gltest_cli.config.general import get_general_config
from gltest_cli.config.types import PluginConfig
from gltest_cli.config.user import load_user_config


ROOT = Path(__file__).parents[1]
DEFAULT_ADDRESS = "0x5e411855907E019d83D7413e99b8F32aEB875623"
SOURCE_URL = "https://raw.githubusercontent.com/Hilda26/pavereon/main/README.md"


def configure_gltest() -> None:
    general = get_general_config()
    general.user_config = load_user_config(str(ROOT / "gltest.config.yaml"))
    general.plugin_config = PluginConfig()


def tx_hash(receipt) -> str:
    return str(receipt.get("hash") or receipt.get("transaction_hash") or receipt.get("tx_hash") or receipt.get("tx_id") or "UNKNOWN")


def wait_tx(call, label: str, value: int = 0):
    receipt = call.transact(
        value=value,
        wait_transaction_status=TransactionStatus.FINALIZED,
        wait_interval=5000,
        wait_retries=240,
    )
    print(f"PAVERON_SEED {label}_TX={tx_hash(receipt)}")
    if not tx_execution_succeeded(receipt):
        raise SystemExit(f"{label} failed: {receipt}")
    return receipt


def main() -> None:
    configure_gltest()
    address = os.environ.get("PAVERON_CONTRACT") or os.environ.get("NEXT_PUBLIC_PAVERON_CONTRACT") or DEFAULT_ADDRESS
    cover_id = os.environ.get("PAVERON_COVER_ID") or "github-docs-availability"
    factory = get_contract_factory(contract_file_path="Paveron.py")
    pool = factory.build_contract(contract_address=address)

    summary = pool.get_pool(args=[]).call()
    print(f"PAVERON_SEED BEFORE={summary}")

    if int(summary["available_capacity"]) < 10:
        wait_tx(pool.fund_reserve(args=[]), "FUND_RESERVE", value=25)

    try:
        cover = pool.get_cover(args=[cover_id]).call()
        print(f"PAVERON_SEED EXISTING_COVER_STATUS={cover['status']}")
    except Exception:
        wait_tx(
            pool.open_cover(
                args=[
                    cover_id,
                    "GitHub docs availability cover",
                    "Infrastructure availability",
                    "Global",
                    (
                        "Pays if the public GitHub raw README for the Paveron project is unavailable or does not "
                        "return readable project documentation for a continuous 24 hour period during the covered window."
                    ),
                    SOURCE_URL,
                    "2026-10-03T00:00:00Z",
                    "2030-01-01T00:00:00Z",
                    10,
                ]
            ),
            "OPEN_COVER",
            value=3,
        )
        cover = pool.get_cover(args=[cover_id]).call()
        print(f"PAVERON_SEED NEW_COVER_STATUS={cover['status']}")

    final_summary = pool.get_pool(args=[]).call()
    print(f"PAVERON_SEED AFTER={final_summary}")
    if int(final_summary["cover_count"]) < 1 or int(final_summary["reserve_balance"]) < 1:
        raise SystemExit(f"seed did not create visible pool state: {final_summary}")
    print(f"PAVERON_SEED SEEDED_AT={int(time.time())}")


if __name__ == "__main__":
    main()
