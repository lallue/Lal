async.parallel({
  equipeUsers: callback => {
    models.TRACEquipeUsers.findAll({
      where: { equipe_id: req.query.id }
    }).then(data => callback(null, data)).catch(callback);
  },

  pointages: callback => {
    // Tu dois d'abord récupérer equipeUserIds
    models.TRACEquipeUsers.findAll({
      where: { equipe_id: req.query.id }
    })
      .then(equipeUsers => {
        const equipeUserIds = equipeUsers.map(u => u.user_id);

        return models.TRACPointage.findAll({
          where: {
            user_id: equipeUserIds, // ⚠️ LIMITATION SQL DÈS ICI
            date: {
              [Op.lt]: endDate,
              [Op.gt]: startDate
            }
          }
        });
      })
      .then(data => callback(null, data))
      .catch(callback);
  }

}, (err, results) => {
  if (err) return next(err);

  // Tu as results.equipeUsers et results.pointages déjà filtrés ✨
  req.dependencies = {
    equipeUsers: results.equipeUsers,
    pointages: results.pointages
  };

  next();
});
