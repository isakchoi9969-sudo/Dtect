# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# import re


# # Chrome 설정
# options = Options()

# # headless를 사용하지 않음
# # 실제 Chrome 창이 뜹니다.
# driver = webdriver.Chrome(options=options)

# try:
#     # 카카오 035720
#     url = "https://stock.naver.com/domestic/stock/035720/price"

#     driver.get(url)

#     # 페이지 로딩 완료까지 대기
#     WebDriverWait(driver, 10).until(
#         lambda d: d.execute_script("return document.readyState") == "complete"
#     )

#     # 페이지 전체 텍스트 가져오기
#     text = driver.find_element(
#         By.TAG_NAME,
#         "body"
#     ).text

#     # -------------------------
#     # 카카오 현재가 추출
#     # -------------------------

#     match = re.search(
#         r"카카오\s*\n([\d,]+)\s*\n원",
#         text
#     )

#     # 전일 대비 + 등락률
#     change_match = re.search(
#         r"카카오\s*\n[\d,]+\s*\n원\s*\n"
#         r"([\d,]+)\s*\n"
#         r"\(([-+\d.]+)%\)",
#         text
#     )

#     print()
#     print("==============================")
#     print("        카카오 주식")
#     print("==============================")

#     if match:
#         current_price = match.group(1)
#         print("현재가 :", current_price, "원")
#     else:
#         print("현재가를 찾지 못했습니다.")

#     if change_match:
#         change_price = change_match.group(1)
#         change_percent = change_match.group(2)

#         print("변동   :", change_price)
#         print("등락률 :", change_percent + "%")

#     print("==============================")

#     # Chrome 창 유지
#     input("\n브라우저를 종료하려면 Enter를 누르세요.")

# finally:
#     driver.quit()