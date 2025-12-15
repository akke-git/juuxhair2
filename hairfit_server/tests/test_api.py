def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to HairFit API"}

def test_register_and_login(client):
    # Register
    response = client.post(
        "/register",
        json={"email": "test@example.com", "username": "testuser", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Login
    response = client.post(
        "/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    login_data = response.json()
    assert "access_token" in login_data

def test_get_members_pagination(client):
    # Register a user to get token
    client.post(
        "/register",
        json={"email": "pagetest@example.com", "username": "pageuser", "password": "password123"}
    )
    login_res = client.post(
        "/login",
        json={"email": "pagetest@example.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create dummy members
    for i in range(15):
        client.post(
            "/members/",
            json={"name": f"Member {i}", "phone": "010-0000-0000"},
            headers=headers
        )

    # Test pagination
    # Default limit is 50, so should get all 15
    response = client.get("/members/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 15

    # Test limit
    response = client.get("/members/?limit=5", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 5

    # Test offset
    response = client.get("/members/?skip=10&limit=10", headers=headers)
    assert response.status_code == 200
    # Total 15, skip 10, remaining 5
    assert len(response.json()) == 5
