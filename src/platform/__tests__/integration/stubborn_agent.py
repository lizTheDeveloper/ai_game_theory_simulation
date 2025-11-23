
import sys
import time
import signal

# Ignore SIGTERM
signal.signal(signal.SIGTERM, signal.SIG_IGN)

print('Stubborn agent started')
sys.stdout.flush()

try:
    while True:
        time.sleep(1)
except:
    pass
