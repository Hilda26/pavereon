def test_paveron_deploys_and_starts_empty(direct_deploy):
    pool = direct_deploy("contracts/Paveron.py", 1)
    summary = pool.get_pool()
    assert summary["cover_count"] == "0"
    assert summary["active_count"] == "0"
    assert summary["paid_count"] == "0"
    assert summary["incident_count"] == "0"
    assert summary["reserve_balance"] == "0"
    assert summary["available_capacity"] == "0"


def test_constructor_rejects_zero_minimum_premium(direct_deploy, direct_vm):
    with direct_vm.expect_revert("Minimum premium"):
        direct_deploy("contracts/Paveron.py", 0)


def test_unknown_cover_read_reverts(direct_deploy, direct_vm):
    pool = direct_deploy("contracts/Paveron.py", 1)
    with direct_vm.expect_revert("Unknown cover"):
        pool.get_cover("missing")


def test_empty_pages_are_empty(direct_deploy):
    pool = direct_deploy("contracts/Paveron.py", 1)
    assert pool.list_covers("", 0, 50) == []
    assert pool.list_incidents("", 0, 50) == []
