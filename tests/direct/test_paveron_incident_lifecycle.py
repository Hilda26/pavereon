import json


SOURCE_URL = "https://evidence.example.com/weather.txt"
EVENT_URL = "https://evidence.example.com/event.txt"
TITLE = "Lagos small-business rain delay cover"
RISK_DOMAIN = "Weather logistics"
REGION = "Lagos, Nigeria"
TRIGGER = (
    "Pays if public weather data reports rainfall severe enough to disrupt same-day delivery routes "
    "for at least 72 hours during the covered window."
)
LOSS_SUMMARY = (
    "The event evidence shows the covered rainfall disruption lasted at least 72 hours and directly "
    "matches the written payout trigger."
)


def _json(**fields):
    return json.dumps(fields)


def _deploy_active_cover(direct_deploy, direct_vm, cover_id="cover-one"):
    direct_vm.warp("2026-01-01T00:00:00Z")
    direct_vm.mock_web("weather\\.txt", {"status": 200, "body": "public weather feed defines rainfall and route disruption data"})
    direct_vm.mock_llm("underwriting a Paveron parametric", _json(verdict="ELIGIBLE", confidence="HIGH", rationale="Trigger is observable and time-boxed."))
    pool = direct_deploy("contracts/Paveron.py", 1)

    direct_vm.value = 20
    pool.fund_reserve()
    direct_vm.value = 2
    pool.open_cover(
        cover_id,
        TITLE,
        RISK_DOMAIN,
        REGION,
        TRIGGER,
        SOURCE_URL,
        "2026-01-01T00:00:00Z",
        "2026-02-01T00:00:00Z",
        8,
    )
    direct_vm.value = 0

    cover = pool.get_cover(cover_id)
    assert cover["status"] == "ACTIVE"
    assert pool.get_pool()["active_count"] == "1"
    assert pool.get_pool()["reserved_exposure"] == "8"
    return pool


def _file_incident(pool, direct_vm, cover_id="cover-one", incident_id="incident-one"):
    direct_vm.mock_web("event\\.txt", {"status": 200, "body": "rainfall disruption exceeded 72 hours across delivery routes"})
    direct_vm.value = 1
    pool.file_incident(incident_id, cover_id, EVENT_URL, LOSS_SUMMARY)
    direct_vm.value = 0


def test_full_payout_closes_cover_and_releases_exposure(direct_deploy, direct_vm):
    pool = _deploy_active_cover(direct_deploy, direct_vm)
    _file_incident(pool, direct_vm)

    opened = pool.get_cover("cover-one")
    assert opened["status"] == "INCIDENT_OPEN"
    assert opened["active_incident_id"] == "incident-one"
    assert pool.get_pool()["active_count"] == "0"

    direct_vm.mock_llm("resolving a Paveron parametric", _json(verdict="FULL_PAYOUT", confidence="HIGH", rationale="Event matches the trigger."))
    pool.resolve_incident("incident-one")

    cover = pool.get_cover("cover-one")
    incident = pool.get_incident("incident-one")
    summary = pool.get_pool()
    assert cover["status"] == "PAID"
    assert cover["reserved_payout"] == "0"
    assert incident["status"] == "FULL_PAYOUT"
    assert incident["payout"] == "8"
    assert summary["paid_count"] == "1"
    assert summary["reserved_exposure"] == "0"


def test_denied_incident_keeps_pool_capital(direct_deploy, direct_vm):
    pool = _deploy_active_cover(direct_deploy, direct_vm, cover_id="cover-two")
    _file_incident(pool, direct_vm, cover_id="cover-two", incident_id="incident-two")

    direct_vm.mock_llm("resolving a Paveron parametric", _json(verdict="NOT_COVERED", confidence="HIGH", rationale="Event does not satisfy the trigger."))
    pool.resolve_incident("incident-two")

    cover = pool.get_cover("cover-two")
    incident = pool.get_incident("incident-two")
    summary = pool.get_pool()
    assert cover["status"] == "DENIED"
    assert incident["status"] == "DENIED"
    assert incident["payout"] == "0"
    assert summary["reserved_exposure"] == "0"


def test_inconclusive_incident_returns_cover_to_active_before_expiry(direct_deploy, direct_vm):
    pool = _deploy_active_cover(direct_deploy, direct_vm, cover_id="cover-three")
    _file_incident(pool, direct_vm, cover_id="cover-three", incident_id="incident-three")

    direct_vm.mock_llm("resolving a Paveron parametric", _json(verdict="INCONCLUSIVE", confidence="LOW", rationale="Evidence is ambiguous."))
    pool.resolve_incident("incident-three")

    cover = pool.get_cover("cover-three")
    incident = pool.get_incident("incident-three")
    assert cover["status"] == "ACTIVE"
    assert cover["active_incident_id"] == ""
    assert incident["status"] == "INCONCLUSIVE"
    assert pool.get_pool()["active_count"] == "1"
