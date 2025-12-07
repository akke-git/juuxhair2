"""
HairFit Database Checker
데이터베이스의 모든 데이터를 조회하는 스크립트
"""
import sqlite3
from datetime import datetime

def format_datetime(dt_str):
    """ISO 형식의 날짜를 읽기 쉬운 형식으로 변환"""
    if not dt_str:
        return "N/A"
    try:
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return dt_str

def main():
    conn = sqlite3.connect('hairfit.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("=" * 80)
    print("HairFit Database Contents")
    print("=" * 80)

    # Users
    print("\n[USERS]")
    print("-" * 80)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    if users:
        for user in users:
            print(f"ID: {user['id']}, Email: {user['email']}, Username: {user['username']}")
            print(f"   Created: {format_datetime(user['created_at'])}")
    else:
        print("No users found")

    # Salons
    print("\n[SALONS]")
    print("-" * 80)
    cursor.execute("""
        SELECT s.*, u.email as owner_email
        FROM salons s
        LEFT JOIN users u ON s.owner_id = u.id
    """)
    salons = cursor.fetchall()
    if salons:
        for salon in salons:
            print(f"ID: {salon['id']}, Name: {salon['name']}")
            print(f"   Owner: {salon['owner_email']} (ID: {salon['owner_id']})")
            print(f"   Created: {format_datetime(salon['created_at'])}")
    else:
        print("No salons found")

    # Members
    print("\n[MEMBERS]")
    print("-" * 80)
    cursor.execute("""
        SELECT m.*, s.name as salon_name
        FROM members m
        LEFT JOIN salons s ON m.salon_id = s.id
    """)
    members = cursor.fetchall()
    if members:
        for member in members:
            print(f"ID: {member['id'][:8]}..., Name: {member['name']}, Phone: {member['phone']}")
            print(f"   Salon: {member['salon_name']}")
            print(f"   Photo: {member['photo_path'] or 'None'}")
            print(f"   Memo: {member['memo'] or 'None'}")
            print(f"   Created: {format_datetime(member['created_at'])}")
            print()
    else:
        print("No members found")

    # Synthesis History
    print("\n[SYNTHESIS HISTORY]")
    print("-" * 80)
    cursor.execute("""
        SELECT sh.*, m.name as member_name
        FROM synthesis_history sh
        LEFT JOIN members m ON sh.member_id = m.id
        ORDER BY sh.created_at DESC
    """)
    histories = cursor.fetchall()
    if histories:
        for hist in histories:
            print(f"ID: {hist['id'][:8]}..., Style: {hist['reference_style_id']}")
            print(f"   Member: {hist['member_name'] or 'None'}")
            print(f"   Original: {hist['original_photo_path']}")
            print(f"   Result: {hist['result_photo_path']}")
            print(f"   Synced: {'Yes' if hist['is_synced'] else 'No'}")
            print(f"   Created: {format_datetime(hist['created_at'])}")
            print()
    else:
        print("No synthesis history found")

    # Statistics
    print("\n[STATISTICS]")
    print("-" * 80)
    cursor.execute("SELECT COUNT(*) as count FROM users")
    print(f"Total Users: {cursor.fetchone()['count']}")

    cursor.execute("SELECT COUNT(*) as count FROM salons")
    print(f"Total Salons: {cursor.fetchone()['count']}")

    cursor.execute("SELECT COUNT(*) as count FROM members")
    print(f"Total Members: {cursor.fetchone()['count']}")

    cursor.execute("SELECT COUNT(*) as count FROM synthesis_history")
    print(f"Total Synthesis History: {cursor.fetchone()['count']}")

    print("=" * 80)

    conn.close()

if __name__ == "__main__":
    main()
