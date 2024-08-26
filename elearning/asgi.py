
# """
# ASGI config for elearning project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
# """

import os
import django
import logging
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elearning.settings')

logging.basicConfig(level=logging.INFO)
logging.info("Before Django setup")

django.setup()

logging.info("After Django setup")

# Imports are here because django has to be setup first (otherwise causes an error)
from courses.middleware import JwtAuthMiddleware 
from courses import routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JwtAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                routing.websocket_urlpatterns
            )
        )
    ),
})