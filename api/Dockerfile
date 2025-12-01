FROM python:3.12-slim

WORKDIR /app
# Copy source files
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY nn_sisa_api.py prod.sh customers.csv ./
RUN chmod +x prod.sh
CMD ["./prod.sh"]