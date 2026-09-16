# import re

# from fastapi import APIRouter
# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait


# router = APIRouter()


# @router.get("/035720")
# def get_kakao_stock():
#     options = Options()

#     # 브라우저 화면 없이 실행
#     options.add_argument("--headless")

#     driver = webdriver.Chrome(options=options)

#     try:
#         url = "https://stock.naver.com/domestic/stock/035720/price"

#         driver.get(url)

#         # 페이지 로딩 완료 대기
#         WebDriverWait(driver, 10).until(
#             lambda d: d.execute_script(
#                 "return document.readyState"
#             ) == "complete"
#         )

#         # 페이지 전체 텍스트
#         text = driver.find_element(
#             By.TAG_NAME,
#             "body"
#         ).text

#         # 현재가
#         price_match = re.search(
#             r"카카오\s*\n([\d,]+)\s*\n원",
#             text
#         )

#         # 등락률
#         change_match = re.search(
#             r"카카오\s*\n[\d,]+\s*\n원\s*\n"
#             r"([\d,]+)\s*\n"
#             r"\(([-+\d.]+)%\)",
#             text
#         )

#         if not price_match:
#             return {
#                 "success": False,
#                 "message": "현재가를 찾지 못했습니다."
#             }

#         current_price = int(
#             price_match.group(1).replace(",", "")
#         )

#         change = None
#         change_rate = None

#         if change_match:
#             change = int(
#                 change_match.group(1).replace(",", "")
#             )

#             change_rate = float(
#                 change_match.group(2)
#             )

#         return {
#             "success": True,
#             "symbol": "035720",
#             "name": "카카오",
#             "price": current_price,
#             "change": change,
#             "changeRate": change_rate
#         }

#     finally:
#         driver.quit()