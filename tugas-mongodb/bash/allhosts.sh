# Add hostname
sudo cp /vagrant/sources/hosts /etc/hosts

# Copy APT sources list
sudo cp '/vagrant/sources/sources.list' '/etc/apt/'
sudo cp '/vagrant/sources/mongodb.list' '/etc/apt/sources.list.d/'

echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf > /dev/null

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 4B7C549A058F8B6B

# Update Repository
sudo apt-get update
# sudo apt-get upgrade -y

# Install MongoDB
sudo apt-get install -y mongodb-org

# Error handling (?)
sudo mkdir -p /var/run/mongodb
sudo touch /var/run/mongodb/mongod.pid
sudo chown -R  mongodb:mongodb /var/run/mongodb/
sudo chown mongodb:mongodb /var/run/mongodb/mongod.pid

# Start MongoDB
sudo service mongod start