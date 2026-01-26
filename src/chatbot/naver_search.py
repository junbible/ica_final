import requests
import json

# -----------------------------------------------------
# [1] 네이버 개발자 센터에서 받은 키를 따옴표("") 안에 넣어주세요
# -----------------------------------------------------
client_id = "MY_KEY"
client_secret = "MY_KEY"

# [2] 검색 설정
keyword = "강남역 맛집"
display_count = 5

# [3] 요청 보내기
url = "https://openapi.naver.com/v1/search/local.json"
headers = {
    "X-Naver-Client-Id": client_id,
    "X-Naver-Client-Secret": client_secret
}
params = {
    "query": keyword,
    "display": display_count
}

print(f"🔎 '{keyword}' 검색을 시작합니다...")

try:
    response = requests.get(url, headers=headers, params=params)

    # [4] 결과 확인
    if response.status_code == 200:
        data = response.json()
        items = data['items']
        
        print("-" * 50)
        for index, item in enumerate(items, 1):
            # HTML 태그 제거
            title = item['title'].replace('<b>', '').replace('</b>', '')
            category = item['category']
            address = item['roadAddress']
            
            print(f"{index}. {title}")
            print(f"   - 분류: {category}")
            print(f"   - 주소: {address}")
            print("-" * 50)
            
        print("✅ 검색 성공! 데이터가 잘 들어왔네요.")
        
    else:
        print("❌ 오류가 났어요. 상태 코드:", response.status_code)
        print("메시지:", response.text)

except Exception as e:
    print("❌ 프로그램 실행 중 에러가 발생했어요:", e)