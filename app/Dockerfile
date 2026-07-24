FROM golang:1.24-bookworm AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . . 
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main .

FROM scratch
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 8000
USER 65534:65534
CMD ["/app/main"]
