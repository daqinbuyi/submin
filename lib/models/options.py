from models import getBackend
backend = getBackend("options")

class Options(object):
	def value(self, key):
		return backend.value(key)

	def set_value(self, key, value):
		backend.set_value(key, value)

	def options(self):
		return backend.options()

	def path(self, key):
		base_path = os.environ['SUBMIN_ENV']
		path = Path(self.value(key))
		if path.absolute:
			return path
		
		return base_path + path
		

__doc__ = """
Backend contract
================

Options consists of a key and a value pair

* value(key)
	Returns the value of *key*

* set_value(key, value)
	Sets option *key* to *value*

* options()
	Returns a dict of all keys and values
"""