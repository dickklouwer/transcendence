FROM node:18

# Set the working directory for the frontend service
WORKDIR /svelte

# Copy package.json and package-lock.json to the container
COPY package*.json /svelte/

# Install project dependencies using npm ci, which is better for fixed versions
RUN npm ci

# Copy the frontend code into the container
COPY . /svelte/

# Command to copy node_modules to a mounted volume and start the Svelte app in development mode
CMD cp -ru /svelte/node_modules/ /svelte/code/node_modules/ && npm run dev --prefix=/svelte/code/