[![GitHub Traffic](https://img.shields.io/badge/dynamic/json?color=success&label=Views&query=count&url=https://gist.githubusercontent.com/yezhenqing/3f4d27bc7c037853175dbb6f01c52c7d/raw/traffic.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)
[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/yezhenqing/2e512507539ee75bdeec75b74a17705f/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)

# Spatial-Live

<img src="./public/spatial-demo.png" width="450" height="400">

## Name
A Lightweight & Versatile Visualization Tool for Spatial-Omics Data.

## Description
Spatial-Live is a lightweight and versatile visualization tool specifically developed for
single cell spatial-omics data analysis, including spatial transcriptiomics and more. Its 3D
integration of multiple layers within a single space makes it highly suitable for
visualizing multi-types spatial data. Leveraging the rendering capabilities of GPU-powered
backend, Spatial-Live efficiently processes large datasets, offering interactivity,
responsiveness, and a wide range of visualization effects through the stacking of multiple
layers. As the saying goes, a picture is worth a thousand words. We firmly believe that
effective data visualization plays a pivotal role in data exploration and interpretation,
serving as a key component in gaining insights from complex datasets. Spatial-Live represents
a valuable tool for achieving these objectives.


The development of Spatial-Live relied on several outstanding third-party libraries, such as
deckgl, vue3, and react framework, alongside numerous other open-source libraries that may
not all be listed here. I am immensely grateful for the contributions of these libraries and
the invaluable work they have provided.

Please visit our [documentation](https://yezhenqing.github.io/spatial-live/) for installation, tutorials, examples and more.


## Installation & Usage
First, please go to github website to download the Spatial-Live:

```bash
  $ git clone https://github.com/yezhenqing/spatial-live
```


There are two ways to start Spatial-Live for different users:

*  regular user 

You may need to install [docker](https://docs.docker.com/engine/install/) on your computer already, then you can run the below command:


```bash
   $ cd spatial-live
   $ docker compose -f docker-compose.yml up -d
```

*  development user

If you are a development user, I will assume you already installed [node/npm](https://nodejs.org/en/download) on your computer:


```bash
   $ cd spatial-live
   $ npm install
   $ npm run dev
```

After the docker instance or node server started, the Spatial-Live will be ready for exploration. 
You can open your browser to visit the url link: http://localhost:8225/

## Citation

If you use `Spatial-Live` in your work, please cite the publication (preprint now) as below:

> **Spatial-Live: A lightweight and versatile tool for single cell spatial-omics data visualization**
>
> Zhenqing Ye, Zhao Lai, Siyuan Zheng, Yidong Chen
>
> _bioRxiv_ 2023 Sep 24. doi: [10.1101/2023.09.24.559173](https://doi.org/10.1101/2023.09.24.559173).

## License
This repository is under MIT License. 

