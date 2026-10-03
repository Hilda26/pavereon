from pathlib import Path


SOURCE = Path(__file__).parents[2] / "contracts" / "Paveron.py"


def test_contract_defines_insurance_cover_states():
    text = SOURCE.read_text()
    for state in ["ACTIVE", "INCIDENT_OPEN", "PAID", "DENIED", "EXPIRED", "RETIRED"]:
        assert state in text


def test_contract_reserves_payout_capacity():
    text = SOURCE.read_text()
    assert "reserved_exposure" in text
    assert "available_capacity" in text
    assert "Payout cap exceeds available reserve capacity" in text


def test_contract_snapshots_underwriting_and_event_evidence():
    text = SOURCE.read_text()
    assert "source_sha256" in text
    assert "event_sha256" in text
    assert "gl.eq_principle.strict_eq(fetch)" in text


def test_contract_has_parametric_resolution_lanes():
    text = SOURCE.read_text()
    assert "FULL_PAYOUT" in text
    assert "PARTIAL_PAYOUT" in text
    assert "NOT_COVERED" in text
    assert "INCONCLUSIVE" in text
