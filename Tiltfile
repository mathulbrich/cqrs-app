if config.tilt_subcommand != 'down':
  allow_k8s_contexts(k8s_context())

docker_compose("./docker/docker-compose.yml")
watch_file("./docker")

dc_resource("cqrs-app", labels="API")
dc_resource("dynamodb", labels="Data-Service")
dc_resource("dynamodb-manager", labels="Data-Service")
dc_resource("elasticmq", labels="Data-Service")
dc_resource("minio", labels="Data-Service")

if os.path.exists('local.tiltfile'):
  load_dynamic('local.tiltfile')