import os
from models.exceptions import UserExistsError, GroupExistsError
from models.exceptions import MemberExistsError

class c_convert():
	'''Create a new configuration from an old-style config
Usage:
    convert <old-config-file>   - Interactively create new config from old'''

	needs_env = False

	def __init__(self, sa, argv):
		self.sa = sa
		self.argv = argv
		os.environ['SUBMIN_ENV'] = self.sa.env

	def read_ini(self, filename):
		import ConfigParser
		cp = ConfigParser.ConfigParser()
		cp.read(filename)
		return cp

	def init_backend(self):
		self.sa.execute(['config', 'defaults'])

	def write_options(self, config):
		from models.options import Options
		o = Options()

		options = {
			'base_url_submin': ('www', 'base_url'),
			'base_url_svn': ('www', 'svn_base_url'),
			'base_url_trac': ('www', 'trac_base_url'),
			'dir_svn': ('svn', 'repositories'),
			'dir_trac': ('trac', 'basedir'),
			'dir_bin': ('backend', 'bindir'),
			'session_salt': ('generated', 'session_salt'),
			'env_path': ('backend', 'path'),
			'auth_authz_file': ('svn', 'authz_file'),
		}
		for (key, section_option) in options.iteritems():
			value = config.get(section_option[0], section_option[1])
			o.set_value(key, value)

	def write_users(self, config):
		from models.user import User

		# get filename
		htpasswd_file = config.get('svn', 'access_file')
		userprop_file = config.get('svn', 'userprop_file')

		# read files
		htpasswd = file(htpasswd_file).readlines()
		userprop = self.read_ini(userprop_file)

		# add users
		for line in htpasswd:
			(user, password) = line.strip('\n').split(':')
			try:
				u = User.add(user, None)
			except UserExistsError:
				u = User(user)

			u.set_md5_password(password)

			if userprop.has_section(user):
				if userprop.has_option(user, 'email'):
					u.email = userprop.get(user, 'email')
				if userprop.has_option(user, 'notifications_allowed'):
					allowed = userprop.get(user, 'notifications_allowed')
					allowed = [x.strip() for x in allowed.split(',')]

					enabled = []
					if userprop.has_option(user, 'notifications_enabled'):
						enabled = userprop.get(user, 'notifications_enabled')
						enabled =  [x.strip() for x in enabled.split(',')]

					repositories = {}
					for repos in allowed:
						repos_enabled = False
						if repos in enabled:
							repos_enabled = True
						repositories[repos] = {'allowed': True, 'enabled': repos_enabled}

					# add notifications
					for repos, details in repositories.iteritems():
						if details['allowed']:
							pass # TODO: set submin read permission
						if details['enabled']:
							u.notification_enable(repos)

	def write_groups(self, config):
		from models.group import Group
		from models.user import User

		# get filename
		authz_file = config.get('svn', 'authz_file')

		# read file
		cp = self.read_ini(authz_file)

		# get groups
		groups = cp.options('groups')
		for group in groups:
			members = [x.strip() for x in cp.get('groups', group).split(',')]
			try:
				g = Group.add(group)
			except GroupExistsError:
				g = Group(group)

			for member in members:
				u = User(member)
				try:
					g.add_member(u)
				except MemberExistsError:
					pass
				if group == "submin-admins":
					u.is_admin = True

	def convert(self, old_config_file):
		config = self.read_ini(old_config_file)
		self.init_backend()
		self.write_options(config)
		self.write_users(config)
		self.write_groups(config)

	def run(self):
		if len(self.argv) != 1:
			self.sa.execute(['help', 'convert'])
			return

		self.convert(self.argv[0])
