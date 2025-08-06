import subprocess
import os
from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/generate-device-report")
def generate_device_report(from_date: str, to_date: str):
    output_path = "app/output/device_report"
    
    JAVA_8_PATH = r"C:\Program Files\Eclipse Adoptium\jdk-8.0.392.8-hotspot\bin\java.exe"  # ✅ Full path to Java 8
    JASPERSTARTER_JAR = os.path.abspath("app/jasperstarter/bin/jasperstarter.jar")         # ✅ Path to .jar

    try:
        result = subprocess.run([
            JAVA_8_PATH,
            "-jar", JASPERSTARTER_JAR,
            "pr", "app/reports/device_report.jasper",
            "-t", "postgres",
            "-u", "postgres",
            "-p", "password",
            "-H", "localhost",
            "-n", "rbac_db",
            "-o", output_path,
            "-f", "pdf",
            f"-Pfrom_date={from_date}",
            f"-Pto_date={to_date}"
        ], check=True, capture_output=True, text=True)

        pdf_file = output_path + ".pdf"
        if os.path.exists(pdf_file):
            return FileResponse(
                path=pdf_file,
                media_type='application/pdf',
                filename="device_report.pdf",
                headers={"Content-Disposition": "inline; filename=device_report.pdf"}
            )
        return {"error": "PDF not found"}

    except subprocess.CalledProcessError as e:
        return {
            "error": "Report generation failed",
            "stdout": e.stdout,
            "stderr": e.stderr,
            "details": str(e)
        }
