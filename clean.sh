#!/bin/bash

echo "Checking Docker disk usage..."
docker system df

echo "Checking inode usage..."
df -i

echo "Pruning unused Docker resources..."
docker system prune -a -f

echo "Checking if /etc/docker/daemon.json exists..."
if [ ! -f /etc/docker/daemon.json ]; then
    echo "Creating /etc/docker/daemon.json..."
    echo '{ "storage-opts": [ "dm.basesize=20G" ] }' | sudo tee /etc/docker/daemon.json
else
    echo "Modifying /etc/docker/daemon.json to increase storage size..."
    sudo sed -i '/"storage-opts": \[/a\    "dm.basesize=20G",' /etc/docker/daemon.json
fi

echo "Restarting Docker..."
sudo systemctl restart docker

echo "All done!"
