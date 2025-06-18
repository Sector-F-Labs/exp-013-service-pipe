# Hypotheses

Modern deployments of service archtectures require a lot of configuration due to the messaging protoculs used to communicate between services. Http requires an address and a port to be configured, and so do other protocols like GRPC, even event streaming protocols like Kafka require a topic to be configured. This is a lot of configuration for a service to handle, and it can be difficult to manage.

Unix philosolophy says to do one thing and do it well, and while this was the promise of microservices, it has become a burden. The service pipe architecture aims to simplify this by using a single protocol for all communication between services, and by using a simple configuration format that can be easily managed: Unix pipes.

Experiment 13 (exp-013) proposes composable services that communicate using a simple protocol based on Unix pipes. This allows services to be composed together in a flexible and dynamic way, without the need for complex configuration something like this:

```bash
telegram-in \
| auth-service \
| capability-dispatcher --capabilities 'canned-responder;llm-responder' \
| load-balancer --workers 4 \
| parallel --jobs 4 --pipe --line-buffer 'llm-proxy | response-formatter' \
| telegram-out
```
