// Import User Department
		// MK 01/2024 made updates to account for depts not updating and duplicate and archived depts
		if (source.u_department.toString() != '') {
			var importDepartment = source.u_department.toString();
			if (importDepartment != '') {
				var splitDept = importDepartment.lastIndexOf("/");
				if (splitDept > -1) {
					importDepartment = importDepartment.slice(splitDept + 1);
				}

				// Query for the current department based on the current date
				var grDept = new GlideRecord('cmn_department');
				grDept.addQuery('name', importDepartment);
				grDept.addQuery('u_start_date', '<=', new GlideDateTime());
				grDept.addQuery('u_end_date', '>=', new GlideDateTime());
				grDept.query();

				if (grDept.next()) {
					// Expire the current department record
					grDept.setValue('u_end_date', new GlideDateTime());
					grDept.update();

					// Link the existing department to the target user
					target.department = grDept.getValue('sys_id');
				} else {
					// Create a new department record only if it doesn't exist
					var newDept = new GlideRecord('cmn_department');
					newDept.addQuery('name', importDepartment);
					newDept.query();

					if (newDept.next()) {
						// If the department already exists with no open end date, link to the target user
						target.department = newDept.getValue('sys_id');
					} else {
						// Create a new department record
						newDept.initialize();
						newDept.setValue('name', importDepartment);
						newDept.setValue('u_start_date', new GlideDateTime());
						newDept.setValue('u_retired', false); // Set the retired flag
						newDept.update();

						// Link the new department record to the target user
						target.department = newDept.getValue('sys_id');
					}
				}
			}
		}
