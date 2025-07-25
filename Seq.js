const { Op } = require('sequelize');

async.parallel({

  // 1️⃣ Charger les utilisateurs de l'équipe
  equipeUsers: callback => {
    models.TRACEquipeUsers.findAll({
      where: { equipe_id: req.query.id }
    }).then(data => callback(null, data)).catch(callback);
  },

  // 2️⃣ Charger les pointages associés aux users de l'équipe
  pointages: callback => {
    // On récupère d'abord les users de l'équipe
    models.TRACEquipeUsers.findAll({
      where: { equipe_id: req.query.id }
    })
      .then(equipeUsers => {
        const userIds = equipeUsers.map(eu => eu.user_id);

        // Ensuite, on filtre directement dans la requête
        return models.TRACPointage.findAll({
          where: {
            user_id: userIds,
            date: {
              [Op.gt]: startDate,
              [Op.lt]: endDate
            }
          }
        });
      })
      .then(pointages => callback(null, pointages))
      .catch(callback);
  }

}, (err, results) => {
  if (err) return next(err);

  // Injecte dans tes dépendances
  req.dependencies = {
    equipeUsers: results.equipeUsers,
    pointages: results.pointages
  };

  next();
});
