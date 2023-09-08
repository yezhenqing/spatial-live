.. Spatial-LVV documentation master file, created by
   sphinx-quickstart on Wed Jun 21 09:48:52 2023.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Spatial-LVV: A Lightweight & Versatile Visualization for Spatial-Omics Data
============================================================================

.. image:: images/spatial-demo.png
   :scale: 36%
   :align: center

**Spatial-LVV** is a lightweight and versatile visualization tool specifically developed for single 
cell spatial-omics data analysis, including spatial transcriptiomics and more. Its 3D integration
of multiple layers within a single space makes it highly suitable for visualizing multi-modal
spatial data. Leveraging the rendering capabilities of WebGL2 (GPU) technology, Spatial-LVV efficiently
processes large datasets, offering interactivity, responsiveness, and a wide range of visualization
effects through the stacking of multiple layers. As the saying goes, a picture is worth  a thousand 
words. We firmly believe that effective data visualization plays a pivotal role in data exploration 
and interpretation, serving as a key component in gaining insights from complex datasets. Spatial-LVV
represents a valuable tool for achieving these objectives.

The development of Spatial-LVV relied on several outstanding third-party libraries, such as deckgl,
vue3, and react framework, alongside numerous other open-source libraries that may not all be listed
here. I am immensely grateful for the contributions of these libraries and the invaluable work they 
have provided.


.. note::

   This project is under active development.


.. toctree::
   :maxdepth: 2
   :caption: Contents:

Contents
--------

.. toctree::
   install
   guide
   notebooks/kidney_demo
   notebooks/liver_demo



Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`