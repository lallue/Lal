update: function (req, res, next) {
  const controllerConfig = req.controllerConfig;
  const id = req.body.id;
  const redirectTo = config.baseurl + controllerConfig.collectionName;

  controllerConfig.model.findByPk(id).then(async function (data) {
    let isUpdate = false;

    if (data) {
      isUpdate = true;

      // 🔐 Sécurisation de req.body.users
      let userIds = req.body.users;
      if (!userIds) {
        userIds = [];
      } else if (!Array.isArray(userIds)) {
        userIds = [userIds]; // transforme un seul ID en tableau
      }

      // ⚙️ Met à jour les relations Many-to-Many proprement
      await data.setUsers(userIds);
    } else {
      if (!id || id === '') {
        data = controllerConfig.model.build(); // création à la main
      } else {
        return res.status(404).send('Not found');
      }
    }

    // ⚙️ Préparation des attributs modifiés
    const modifiedAttributes = data.parseFormData(req, res);
    
    if (isUpdate) {
      modifiedAttributes.rowVersion = (data.rowVersion || 0) + 1;

      controllerConfig.model.update(modifiedAttributes, {
        where: { id: data.id }
      })
        .then(() => res.status(200).redirect(redirectTo))
        .catch(err => res.status(500).json({ error: err.message }));
    } else {
      controllerConfig.model.create(modifiedAttributes)
        .then(async (newData) => {
          // 🔁 Gère les users à la création aussi
          let userIds = req.body.users;
          if (!userIds) {
            userIds = [];
          } else if (!Array.isArray(userIds)) {
            userIds = [userIds];
          }
          await newData.setUsers(userIds);
          res.status(200).redirect(redirectTo);
        })
        .catch(err => res.status(500).json({ error: err.message }));
    }
  }).catch(err => {
    return res.status(500).json({ error: err.message });
  });
}
