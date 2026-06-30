from fastapi import FastAPI

app = FastAPI(title="Pathology SaaS API")

@app.get("/")
async def root():
    return {"message": "Pathology SaaS API is running"}