#!/usr/bin/python
import os

class App(object):
	def __init__(self):
		self.run()

	def systemlibdir(self):
		import inspect

		basefile = inspect.getmodule(self).__file__
		# Basefile will contain <basedir>/bin/submin_admin.py
		basedir_bin = os.path.dirname(basefile)
		basedir = os.path.dirname(basedir_bin)
		return os.path.join(basedir, 'lib')

	def run(self):
		from sys import argv, path

		path.append(self.systemlibdir())
		# env = 'SUBMIN_LIB_DIR'
		# if env in os.environ:
		# 	path.append(os.environ[env])

		try:
			from subminadmin import SubminAdmin
		except ImportError, e:
			print e
			print "is environment %s set?" % env
			return

		sa = SubminAdmin(argv)
		sa.run()

if __name__ == "__main__":
	a = App()
