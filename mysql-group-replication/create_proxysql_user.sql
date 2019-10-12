CREATE USER 'monitor'@'%' IDENTIFIED BY 'monitorpassword';
GRANT SELECT on sys.* to 'monitor'@'%';
FLUSH PRIVILEGES;

CREATE USER 'mybuffet'@'%' IDENTIFIED BY '123';
GRANT ALL PRIVILEGES on mybuffet.* to 'mybuffet'@'%';
FLUSH PRIVILEGES;