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
    wget -qO/bin/grpc_health_probe https://hub.nuaa.cf/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe


# Build Go binary
COPY go.mod go.sum ./
RUN go env -w GO111MODULE="on"
RUN go env -w GOPROXY=https://goproxy.io,direct/
RUN go env -w GOPRIVATE="gitlab.com/annoying-orange/*"

RUN git config  --global url."https://${USERNAME}:${TOKEN}@gitlab.com".insteadOf "https://gitlab.com"

# RUN go mod download
RUN go mod download
COPY . .

# RUN make proto tidy
RUN go mod tidy

RUN go build -o /go/src/shenzhouyinji/event .

# Deployment container
FROM scratch

# Definition of this variable is used by 'skaffold debug' to identify a golang binary.
# Default behavior - a failure prints a stack trace for the current goroutine.
# See https://golang.org/pkg/runtime/

ARG DB_SOURCE_VALUE
ARG CONSUL_REG_ADDRESS_VALUE

ENV GOTRACEBACK=single
ENV DB_SOURCE=${DB_SOURCE_VALUE}
ENV CONSUL_REG_ADDRESS=${CONSUL_REG_ADDRESS_VALUE}

COPY --from=builder /etc/ssl/certs /etc/ssl/certs
COPY --from=builder /bin/grpc_health_probe /bin/
COPY --from=builder /go/src/shenzhouyinji/event /shenzhouyinji/event

ENTRYPOINT ["/shenzhouyinji/event"]