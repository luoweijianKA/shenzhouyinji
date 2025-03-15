FROM golang:1.19.0-alpine AS builder

# Set Go env
ENV CGO_ENABLED=0 GOOS=linux
WORKDIR /go/src/shenzhouyinji

# Install dependencies
RUN apk --update --no-cache add ca-certificates make protoc git wget

ARG GITHUB_TOKEN
ARG GITHUB_USERNAME

ENV TOKEN=$GITHUB_TOKEN
ENV USERNAME=$GITHUB_USERNAME

# Download grpc_health_probe
# https://github.com >> https://hub.yzuu.cf/ or https://hub.nuaa.cf/
RUN GRPC_HEALTH_PROBE_VERSION=v0.4.11 && \
    wget -qO/bin/grpc_health_probe https://mirror.ghproxy.com/https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

# Build Go binary
COPY go.mod go.sum ./
RUN go env -w GO111MODULE="on"
RUN go env -w GOPROXY=https://goproxy.io,direct/
RUN go env -w GOPRIVATE="gitlab.com/annoying-orange/*"

RUN git config  --global url."https://${USERNAME}:${TOKEN}@gitlab.com".insteadOf "https://gitlab.com"

# RUN make init && go mod download
RUN go mod download
RUN go get golang.org/x/crypto@v0.23.0
COPY . .

# RUN make proto tidy
RUN go mod tidy

RUN go build -o /go/src/shenzhouyinji/gateway .

# Deployment container
FROM scratch

# Definition of this variable is used by 'skaffold debug' to identify a golang binary.
# Default behavior - a failure prints a stack trace for the current goroutine.
# See https://golang.org/pkg/runtime/

ARG DB_URI_VALUE
ARG DB_NAME_VALUE
ARG CONSUL_REG_ADDRESS_VALUE

ENV GOTRACEBACK=single
ENV DB_URI=${DB_URI_VALUE}
ENV DB_NAME=${DB_NAME_VALUE}
ENV CONSUL_REG_ADDRESS=${CONSUL_REG_ADDRESS_VALUE}

ARG WECHAT_APPID_VALUE
ARG WECHAT_SECRET_VALUE

ENV WECHAT_APPID=${WECHAT_APPID_VALUE}
ENV WECHAT_SECRET=${WECHAT_SECRET_VALUE}

COPY --from=builder /etc/ssl/certs /etc/ssl/certs
COPY --from=builder /bin/grpc_health_probe /bin/
COPY --from=builder /go/src/shenzhouyinji/gateway /shenzhouyinji/gateway

ENTRYPOINT ["/shenzhouyinji/gateway"]