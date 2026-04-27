import streamlit as st
import pulp
import os
from groq import Groq

# =========================
# 🔑 GÜVENLİ API KEY (STREAMLIT SECRETS)
# =========================
# Artık anahtarı kodun içine yazmıyoruz, Streamlit'in güvenli kasasından çekiyoruz.
api_key = st.secrets["GROQ_API_KEY"]
client = Groq(api_key=api_key)

# =========================
# STREAMLIT UI
# =========================
# ... (Kodun geri kalanı tamamen aynı) ...
# =========================
# STREAMLIT UI
# =========================
st.set_page_config(page_title="Üretim DSS", page_icon="🏭")
st.title("🤖 GenAI Production Decision Support System")

st.write("Üretim planını oluştur ve yapay zeka analizini gör (Groq & Llama-3.3 Destekli).")

# Kullanıcı Girdileri - Birimler (dk) olarak güncellendi
col1, col2, col3 = st.columns(3)
with col1:
    job1 = st.number_input("Job1 süresi (dk)", value=5, min_value=1)
with col2:
    job2 = st.number_input("Job2 süresi (dk)", value=8, min_value=1)
with col3:
    job3 = st.number_input("Job3 süresi (dk)", value=3, min_value=1)

machine_count = st.slider("Makine sayısı", 1, 3, 2)

# =========================
# RUN
# =========================
if st.button("Optimize Et 🚀", use_container_width=True):

    jobs = {"Job1": job1, "Job2": job2, "Job3": job3}
    machines = [f"M{i + 1}" for i in range(machine_count)]

    # =========================
    # OPTIMIZATION MODEL (PULP)
    # =========================
    model = pulp.LpProblem("Production_Optimization", pulp.LpMinimize)

    # Karar Değişkenleri
    x = pulp.LpVariable.dicts(
        "assign",
        [(j, m) for j in jobs for m in machines],
        cat="Binary"
    )

    # Makespan
    Cmax = pulp.LpVariable("Cmax", lowBound=0)
    model += Cmax

    for j in jobs:
        model += sum(x[(j, m)] for m in machines) == 1

    for m in machines:
        model += sum(jobs[j] * x[(j, m)] for j in jobs) <= Cmax

    model.solve()

    # =========================
    # RESULT (Birim güncellemeleri burada yapıldı)
    # =========================
    st.divider()
    st.subheader("📊 Optimizasyon Sonucu")

    result_text = ""
    makespan_value = pulp.value(Cmax)

    st.metric(label="Maksimum Tamamlanma Süresi (Makespan)", value=f"{makespan_value} dk")
    result_text += f"Makespan: {makespan_value} dk\n"

    st.write("**Makine Atamaları:**")
    for j in jobs:
        for m in machines:
            if pulp.value(x[(j, m)]) == 1:
                # Çıktı metni dk olarak güncellendi
                line = f"- {j} -> {m} makinesinde işlenecek (Süre: {jobs[j]} dk)"
                st.write(line)
                result_text += line + "\n"

    # =========================
    # AI ANALYSIS (Birim bilgisi prompt'a eklendi)
    # =========================
    st.divider()
    st.subheader("🤖 AI Analizi")

    prompt = f"""
    Aşağıdaki üretim planını bir endüstri mühendisi gözüyle analiz et. 
    Not: Tüm süre birimleri dakikadır (dk).

    {result_text}
    Toplam Makine Sayısı: {machine_count}

    Lütfen şu 3 soruyu yanıtla:
    1. Darboğaz (bottleneck) nerede oluşuyor?
    2. Bu çizelgeyi veya üretim hattını daha verimli hale getirmek için nasıl bir iyileştirme yapılabilir?
    3. Alternatif bir çözüm önerin var mı?
    """

    with st.spinner("🧠 Llama-3.3 üretim planını analiz ediyor..."):
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "Sen kıdemli bir endüstri mühendisi ve üretim planlama uzmanısın. Yanıtlarını profesyonel bir dille, her zaman Türkçe ve maddeler halinde ver."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.4,
            )

            st.success("✅ AI Analizi Başarılı")
            st.write(chat_completion.choices[0].message.content)

        except Exception as e:
            st.error(f"❌ AI çalışmadı. Hata detayı: {e}")
